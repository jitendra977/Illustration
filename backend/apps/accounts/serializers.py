"""
Serializers for user authentication and management.
"""
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import User, Factory, Role, FactoryMember, Comment

class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ['id', 'name', 'address']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'code', 
            'can_manage_users', 'can_manage_jobs', 
            'can_view_finance', 'can_edit_finance',
            'can_create_illustrations', 'can_edit_illustrations', 
            'can_delete_illustrations', 'can_view_all_factory_illustrations'
        ]

class FactoryMemberSerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(source='factory.name', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = FactoryMember
        fields = [
            'id', 'user', 'user_email', 'factory', 'factory_name', 
            'role', 'role_name', 'role_code', 'is_active', 'joined_at'
        ]
        read_only_fields = ['joined_at']

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model (read operations)."""
    factory_memberships = FactoryMemberSerializer(many=True, read_only=True)
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'factory_memberships', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'phone_number', 'profile_image', 'groups', 'user_permissions',
            'is_verified', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = [
            'id', 'is_staff', 'is_superuser', 'date_joined',
            'groups', 'user_permissions', 'is_verified', 'last_login', 
            'created_at', 'updated_at',
        ]

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management (full control)."""
    password = serializers.CharField(
        write_only=True, 
        required=False,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Leave blank to keep current password when editing"
    )

    factory_memberships = FactoryMemberSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'is_verified', 
            'phone_number', 'profile_image', 'password',
            'date_joined', 'last_login', 'factory_memberships'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Generate random password if not provided (shouldn't happen in UI usually)
            user.set_password(User.objects.make_random_password())
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Re-enter your password for confirmation"
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'profile_image'
        ]
        extra_kwargs = {
            'email': {
                'required': True,
                'help_text': 'A valid email address is required'
            },
            'username': {
                'required': True,
                'help_text': 'Username must be unique'
            },
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'profile_image': {'required': False},
        }

    def validate_email(self, value):
        """Validate that email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_username(self, value):
        """Validate username."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate_password(self, value):
        """Validate password using Django's password validators."""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Validate registration data."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match"
            })
        return attrs
    
    def create(self, validated_data):
        """Create and return a new user instance."""
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Send verification email after user creation
        try:
            user.send_verification_email()
        except Exception as e:
            # Log the error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email: {e}")
        
        return user


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    
    token = serializers.UUIDField(
        help_text="Email verification token received via email"
    )

    def validate_token(self, value):
        """Validate that token exists and is not already verified."""
        try:
            user = User.objects.get(verification_token=value)
            if user.is_verified:
                raise serializers.ValidationError("Email is already verified")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid or expired verification token"
            )


class UpdateUserSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    password = serializers.CharField(
        write_only=True, 
        required=False,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Leave blank to keep current password"
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=False,
        style={'input_type': 'password'},
        help_text="Confirm new password"
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone_number', 'profile_image', 'password', 'password_confirm'
        ]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'profile_image': {'required': False},
        }

    def validate_email(self, value):
        """Validate that email is unique (excluding current user)."""
        user = self.instance
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_username(self, value):
        """Validate that username is unique (excluding current user)."""
        user = self.instance
        if User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate_password(self, value):
        """Validate password using Django's password validators."""
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Validate update data including optional password change."""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        # If either password field is provided, both must be provided
        if password or password_confirm:
            if not password or not password_confirm:
                raise serializers.ValidationError({
                    "password": "Both password and password_confirm are required to change password"
                })
            if password != password_confirm:
                raise serializers.ValidationError({
                    "password_confirm": "Passwords do not match"
                })
        
        return attrs

    def update(self, instance, validated_data):
        """Update user instance."""
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change functionality."""
    
    old_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'},
        help_text="Your current password"
    )
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'},
        help_text="Your new password (minimum 8 characters)"
    )
    confirm_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirm your new password"
    )

    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate_new_password(self, value):
        """Validate new password using Django's password validators."""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        """Validate password change data."""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New passwords do not match"
            })
        
        # Ensure new password is different from old password
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password"
            })
        
        return data


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """
    Enhanced JWT token serializer supporting email/username login.
    Accepts both {"email": "...", "password": "..."} and {"username": "...", "password": "..."}
    """
    
    username = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text="Login with username"
    )
    email = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text="Login with email"
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    
    def validate(self, attrs):
        """Authenticate user via username or email."""
        print(f"=== LOGIN DEBUG ===")
        print(f"Received attrs: {attrs}")
        
        # Get credentials from request
        username = attrs.get("username", "").strip()
        email = attrs.get("email", "").strip()
        password = attrs.get("password")
        
        print(f"Username: '{username}'")
        print(f"Email: '{email}'")
        print(f"Password provided: {bool(password)}")

        # Validate that at least one credential is provided
        if not username and not email:
            raise serializers.ValidationError(
                "Either username or email is required"
            )
        
        if not password:
            raise serializers.ValidationError(
                "Password is required"
            )

        user = None
        
        # Try to authenticate with email if provided
        if email:
            try:
                user_obj = User.objects.get(email=email.lower())
                if user_obj.check_password(password):
                    user = user_obj
                    print(f"User authenticated with email: {user.username}")
            except User.DoesNotExist:
                print(f"No user found with email: {email}")
                pass
        
        # Try to authenticate with username if provided and user not found yet
        if not user and username:
            try:
                user_obj = User.objects.get(username=username)
                if user_obj.check_password(password):
                    user = user_obj
                    print(f"User authenticated with username: {user.username}")
            except User.DoesNotExist:
                print(f"No user found with username: {username}")
                pass

        # If still no user found, raise error
        if not user:
            raise serializers.ValidationError(
                "Invalid credentials provided"
            )

        # Check if account is active
        if not user.is_active:
            raise serializers.ValidationError(
                "Account is disabled. Please contact support."
            )

        # Optional: Check if email is verified
        # Uncomment the following lines to require email verification before login
        # if not user.is_verified:
        #     raise serializers.ValidationError(
        #         "Please verify your email address before logging in"
        #     )

        # Update last login timestamp
        user.last_login = timezone.now()
        user.save(update_fields=['last_login', 'updated_at'])
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['username'] = user.username
        refresh['email'] = user.email
        refresh['is_verified'] = user.is_verified
        
        # Serialize user data
        user_data = UserSerializer(user).data
        
        print(f"Login successful for user: {user.username}")
        print(f"=== END LOGIN DEBUG ===")
        
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user_data,
        }


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for user feedback/comments."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'department_name', 'comment', 'star', 
            'user', 'user_email', 'user_name', 'date'
        ]
        read_only_fields = ['id', 'date', 'user']
    
    def get_user_name(self, obj):
        """Get user's full name or username."""
        if obj.user:
            if obj.user.first_name and obj.user.last_name:
                return f"{obj.user.last_name} {obj.user.first_name}"
            return obj.user.username
        return None
    
    def validate_star(self, value):
        """Validate star rating is between 1 and 5."""
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Star rating must be between 1 and 5"
            )
        return value
    
    def validate_comment(self, value):
        """Validate comment is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Comment cannot be empty"
            )
        return value.strip()
    
    def validate_department_name(self, value):
        """Validate department name is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Department name cannot be empty"
            )
        return value.strip()