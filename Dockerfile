# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
# This is run during the build process to include static files in the image
RUN python backend/manage.py collectstatic --noinput

# Expose port that Gunicorn will run on
EXPOSE 8000

# Command to run the application
# Use --chdir to specify the directory of the Django project
CMD ["gunicorn", "--chdir", "backend", "--bind", "0.0.0.0:8000", "blossom_educare.wsgi"]
