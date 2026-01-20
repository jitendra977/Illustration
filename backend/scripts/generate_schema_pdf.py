from fpdf import FPDF
from fpdf.enums import XPos, YPos

class SchemaPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 15)
        self.cell(0, 10, 'Illustration System - Database Schema', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L', fill=True)
        self.ln(4)

    def model_header(self, name, description):
        self.set_font('Helvetica', 'B', 10)
        self.cell(0, 8, f'Model: {name}', border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        if description:
            self.set_font('Helvetica', 'I', 9)
            self.multi_cell(0, 5, description)
        self.ln(2)

    def table_header(self):
        self.set_font('Helvetica', 'B', 9)
        self.set_fill_color(240, 240, 240)
        self.cell(45, 7, 'Field Name', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L', fill=True)
        self.cell(50, 7, 'Type / Rules', border=1, new_x=XPos.RIGHT, new_y=YPos.TOP, align='L', fill=True)
        self.cell(0, 7, 'Description', border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L', fill=True)

    def row(self, name, type_info, desc):
        self.set_font('Helvetica', '', 8)
        # We use a fixed height for the row or use multi_cell with calculation.
        # For simplicity, let's just make sure description is the last one on the line.
        self.cell(45, 8, name, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(50, 8, type_info, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.multi_cell(0, 8, desc, border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def generate_schema_pdf():
    pdf = SchemaPDF()
    pdf.add_page()

    # --- ACCOUNTS ---
    pdf.chapter_title('1. Accounts & Organization')
    
    # User Model
    pdf.model_header('User', 'Core authentication model. Inherits from AbstractUser.')
    pdf.table_header()
    pdf.row('email', 'Email (Unique, PK)', 'Primary login field.')
    pdf.row('username', 'String', 'Secondary identification.')
    pdf.row('phone_number', 'String (Optional)', 'User contact info.')
    pdf.row('profile_image', 'ImageField', 'Stored under Users/<username>/profile/')
    pdf.row('is_verified', 'Boolean', 'Email verification status.')
    pdf.ln(5)

    # Factory Model
    pdf.model_header('Factory', 'Represents a workspace/company unit.')
    pdf.table_header()
    pdf.row('name', 'String (100)', 'Name of the factory.')
    pdf.row('address', 'String (150)', 'Physical location.')
    pdf.ln(5)

    # FactoryMember Model
    pdf.model_header('FactoryMember', 'Junction table linking Users to Factories with specific Roles.')
    pdf.table_header()
    pdf.row('user', 'FK (User)', 'Reference to user.')
    pdf.row('factory', 'FK (Factory)', 'Reference to factory.')
    pdf.row('role', 'FK (Role)', 'Permission level in this factory.')
    pdf.row('is_active', 'Boolean', 'Current membership status.')
    pdf.ln(10)

    # --- ILLUSTRATIONS ---
    pdf.add_page()
    pdf.chapter_title('2. Vehicle Catalog & Illustrations')

    # Manufacturer Model
    pdf.model_header('Manufacturer', 'Vehicle creators (e.g., Hino, Toyota).')
    pdf.table_header()
    pdf.row('name', 'String (Unique)', 'Official name.')
    pdf.row('slug', 'String (Unique)', 'URL-friendly name.')
    pdf.ln(5)

    # EngineModel Model
    pdf.model_header('EngineModel', 'Engine specifications linked to Manufacturers.')
    pdf.table_header()
    pdf.row('name', 'String', 'e.g., A09C, 6HK1.')
    pdf.row('fuel_type', 'Choices', 'Diesel, Petrol, Hybrid, etc.')
    pdf.ln(5)

    # Illustration Model
    pdf.model_header('Illustration', 'Central model for uploaded diagrams.')
    pdf.table_header()
    pdf.row('engine_model', 'FK (EngineModel)', 'Which engine this is for.')
    pdf.row('part_category', 'FK (Category)', 'Universal part grouping.')
    pdf.row('part_subcategory', 'FK (SubCat)', 'Specific part type.')
    pdf.row('factory', 'FK (Factory)', 'Ownership tagging.')
    pdf.row('title', 'String', 'Name of the illustration.')
    pdf.ln(5)

    # IllustrationFile Model
    pdf.model_header('IllustrationFile', 'Media files attached to an Illustration.')
    pdf.table_header()
    pdf.row('illustration', 'FK (Illustration)', 'Parent illustration.')
    pdf.row('file', 'FileField', 'Stored in structured folders.')
    pdf.row('file_type', 'Choices', 'Image, PDF, Other.')
    
    output_path = '/Volumes/Programming/React-Python/YAW/Illustration-System/Illustration_Schema_Documentation.pdf'
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == '__main__':
    generate_schema_pdf()
