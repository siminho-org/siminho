#!/bin/bash

# Siminho - Local Setup Script
# This script helps set up and run the Siminho application locally

set -e

echo "==================================="
echo "Siminho - Local Setup"
echo "==================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker is installed"
echo "✓ Docker Compose is installed"
echo ""

# Ask user which mode to run
echo "Choose a setup mode:"
echo "1) Full Docker setup (Recommended - Frontend, Backend, Database)"
echo "2) Database only (For local development)"
echo "3) Development mode with hot reload"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Starting full Docker setup..."
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "Starting PostgreSQL database only..."
        docker-compose up postgres
        ;;
    3)
        echo ""
        echo "Starting development mode with hot reload..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
