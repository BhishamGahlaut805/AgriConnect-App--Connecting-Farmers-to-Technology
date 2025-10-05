import os
from datetime import datetime
from reportlab.lib.pagesizes import A4  # type:ignore
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle  # type:ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle    # type:ignore
from reportlab.lib.units import inch    # type:ignore
from reportlab.lib import colors    # type:ignore
from ..config import DEFAULT_DATA_DIR, logger

def save_data_as_pdf(data_type: str, data: dict, **kwargs) -> str:
    """Save data as PDF file and return file path"""
    try:
        # Create directory structure
        pdf_dir = os.path.join(DEFAULT_DATA_DIR, "pdfs", data_type)
        os.makedirs(pdf_dir, exist_ok=True)

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if data_type == "weather":
            filename = f"weather_{kwargs.get('location', 'unknown')}_{timestamp}.pdf"
        elif data_type == "news":
            filename = f"news_{kwargs.get('source', 'unknown')}_{timestamp}.pdf"
        elif data_type == "bulletin":
            filename = f"bulletin_{kwargs.get('state', 'unknown')}_{timestamp}.pdf"
        elif data_type == "disease":
            filename = f"disease_{kwargs.get('disease_name', 'unknown').replace(' ', '_')}_{timestamp}.pdf"
        else:
            filename = f"{data_type}_{timestamp}.pdf"

        filepath = os.path.join(pdf_dir, filename)

        # Create PDF
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            textColor=colors.darkblue
        )

        if data_type == "weather":
            title = f"Weather Report - {kwargs.get('location', 'Unknown Location')}"
        elif data_type == "news":
            title = f"News Update - {kwargs.get('source', 'Unknown Source')}"
        elif data_type == "bulletin":
            title = f"Agricultural Bulletin - {kwargs.get('state', 'Unknown State')}"
        elif data_type == "disease":
            title = f"Crop Disease Info - {kwargs.get('disease_name', 'Unknown Disease')}"
        else:
            title = f"{data_type.title()} Report"

        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.2*inch))

        # Content based on data type
        if data_type == "weather":
            story.extend(_create_weather_content(data, styles))
        elif data_type == "news":
            story.extend(_create_news_content(data, styles))
        elif data_type == "bulletin":
            story.extend(_create_bulletin_content(data, styles))
        elif data_type == "disease":
            story.extend(_create_disease_content(data, styles))
        else:
            story.extend(_create_general_content(data, styles))

        # Footer
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        story.append(Paragraph("Source: Agribot Knowledge Base", styles['Normal']))

        doc.build(story)
        logger.info(f"PDF saved: {filepath}")
        return filepath

    except Exception as e:
        logger.error(f"Failed to create PDF for {data_type}: {e}")
        raise

def _create_weather_content(data: dict, styles) -> list:
    """Create weather report content"""
    content = []

    # Summary table
    table_data = [
        ['Parameter', 'Value'],
        ['Temperature', f"{data.get('temperature_avg', 'N/A')}°C"],
        ['Humidity', f"{data.get('humidity_avg', 'N/A')}%"],
        ['Location', data.get('location', 'N/A')],
        ['Timestamp', data.get('timestamp', 'N/A')]
    ]

    table = Table(table_data, colWidths=[2*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    content.append(Paragraph("Weather Summary", styles['Heading2']))
    content.append(Spacer(1, 0.1*inch))
    content.append(table)

    return content

def _create_news_content(data: dict, styles) -> list:
    """Create news content"""
    content = []

    content.append(Paragraph("News Details", styles['Heading2']))
    content.append(Spacer(1, 0.1*inch))

    content.append(Paragraph(f"<b>Title:</b> {data.get('title', 'N/A')}", styles['Normal']))
    content.append(Paragraph(f"<b>Source:</b> {data.get('source', 'N/A')}", styles['Normal']))
    content.append(Paragraph(f"<b>Published:</b> {data.get('published_at', 'N/A')}", styles['Normal']))

    if data.get('summary'):
        content.append(Spacer(1, 0.1*inch))
        content.append(Paragraph("Summary:", styles['Heading3']))
        content.append(Paragraph(data.get('summary', ''), styles['Normal']))

    return content

def _create_bulletin_content(data: dict, styles) -> list:
    """Create bulletin content"""
    content = []

    content.append(Paragraph("Bulletin Information", styles['Heading2']))
    content.append(Spacer(1, 0.1*inch))

    content.append(Paragraph(f"<b>State:</b> {data.get('state', 'N/A')}", styles['Normal']))
    content.append(Paragraph(f"<b>Source:</b> {data.get('source', 'N/A')}", styles['Normal']))

    if data.get('content'):
        content.append(Spacer(1, 0.1*inch))
        content.append(Paragraph("Content:", styles['Heading3']))
        # Split content into paragraphs for better formatting
        paragraphs = data.get('content', '').split('\n')
        for para in paragraphs[:10]:  # Limit to first 10 paragraphs
            if para.strip():
                content.append(Paragraph(para.strip(), styles['Normal']))
                content.append(Spacer(1, 0.05*inch))

    return content

def _create_disease_content(data: dict, styles) -> list:
    """Create disease information content"""
    content = []

    content.append(Paragraph("Disease Information", styles['Heading2']))
    content.append(Spacer(1, 0.1*inch))

    table_data = [
        ['Attribute', 'Details'],
        ['Disease', data.get('disease', 'N/A')],
        ['Crop', data.get('crop', 'N/A')],
        ['Symptoms', data.get('symptoms', 'N/A')],
        ['Treatment', data.get('treatment', 'N/A')],
        ['Prevention', data.get('prevention', 'N/A')]
    ]

    table = Table(table_data, colWidths=[1.5*inch, 4*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('WORDWRAP', (0, 0), (-1, -1), True)
    ]))

    content.append(table)

    return content

def _create_general_content(data: dict, styles) -> list:
    """Create general content for unknown data types"""
    content = []

    content.append(Paragraph("Data Report", styles['Heading2']))
    content.append(Spacer(1, 0.1*inch))

    for key, value in data.items():
        if isinstance(value, (str, int, float)):
            content.append(Paragraph(f"<b>{key}:</b> {value}", styles['Normal']))

    return content