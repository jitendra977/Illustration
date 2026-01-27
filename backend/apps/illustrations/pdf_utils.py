import io
import os
from django.core.mail import EmailMessage
from django.conf import settings
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image

def create_overlay_pdf(image_data, width, height):
    """
    Creates a single-page PDF containing the provided image, 
    scaled to the specified dimensions.
    """
    packet = io.BytesIO()
    # Create a new PDF with Reportlab
    can = canvas.Canvas(packet, pagesize=(float(width), float(height)))
    
    # Draw the image onto the PDF canvas
    # The image_data is expected to be a file-like object (BytesIO) or path
    # If it's raw bytes, wrap in BytesIO
    if isinstance(image_data, bytes):
        image_data = io.BytesIO(image_data)
        
    img = ImageReader(image_data)
    can.drawImage(img, 0, 0, width=float(width), height=float(height), mask='auto')
    can.save()

    # Move to the beginning of the StringIO buffer
    packet.seek(0)
    return packet

def generate_edited_pdf(original_pdf_path, edited_pages_list):
    """
    Generates a merged PDF with drawings overlayed.
    Returns: io.BytesIO buffer containing the PDF.
    """
    try:
        reader = PdfReader(original_pdf_path)
        final_writer = PdfWriter()
        
        total_pages = len(reader.pages)
        
        for item in edited_pages_list:
            page_number = item['page_number']
            drawing_image_file = item['image_file']
            
            if page_number < 1 or page_number > total_pages:
                continue
                
            page_index = page_number - 1
            target_page = reader.pages[page_index]
            
            # Debug logging
            print(f"Processing Page {page_number}")

            # Get Page Rotation and Dimensions
            rotation = target_page.get('/Rotate', 0)
            mbox = target_page.mediabox
            pdf_width = float(mbox.width)
            pdf_height = float(mbox.height)
            
            # --- Resize & Transform Image ---
            if isinstance(drawing_image_file, bytes):
                drawing_image_file = io.BytesIO(drawing_image_file)
            
            from PIL import ImageOps
            
            with Image.open(drawing_image_file) as pil_img:
                max_dim = 2000
                if pil_img.width > max_dim or pil_img.height > max_dim:
                    pil_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                
                # Handle Rotation (-rotation to align visuals)
                if rotation != 0:
                    pil_img = pil_img.rotate(-rotation, expand=True)

                # Handle Coordinate System (Flip Vertical for PDF bottom-left origin)
                pil_img = ImageOps.flip(pil_img)
                
                optimized_img_buffer = io.BytesIO()
                pil_img.save(optimized_img_buffer, format='PNG', optimize=True)
                optimized_img_buffer.seek(0)
            
            # --- Create Overlay ---
            overlay_pdf_stream = create_overlay_pdf(optimized_img_buffer, pdf_width, pdf_height)
            overlay_reader = PdfReader(overlay_pdf_stream)
            overlay_page = overlay_reader.pages[0]
            
            # Merge
            target_page.merge_page(overlay_page)
            
            final_writer.add_page(target_page)
            
        output_buffer = io.BytesIO()
        final_writer.write(output_buffer)
        output_buffer.seek(0)
        
        return output_buffer
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise e

def process_and_email_edited_pages(original_pdf_path, edited_pages_list, recipient_email, subject, body):
    """
    Generates PDF and sends it via email.
    """
    try:
        output_buffer = generate_edited_pdf(original_pdf_path, edited_pages_list)
        
        # Send Email
        filename = os.path.basename(original_pdf_path)
        base_name, _ = os.path.splitext(filename)
        
        email = EmailMessage(
            subject=subject or f"Edited: {filename}",
            body=body or "Please find the edited illustration pages attached.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        
        count = len(edited_pages_list)
        email.attach(f"{base_name}_selected_{count}pages.pdf", output_buffer.getvalue(), 'application/pdf')
        email.send()
        
        return True

    except Exception as e:
        print(f"Error merging/sending PDF: {e}")
        raise e
