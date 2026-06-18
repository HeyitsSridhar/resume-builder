"""
Vercel serverless function handler for FastAPI backend
"""
import sys
import os

# Add parent directory to path to import main module
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

# Export the FastAPI app for Vercel
