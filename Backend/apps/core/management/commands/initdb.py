from django.core.management.base import BaseCommand
from django.db import connection
import os
import re


class Command(BaseCommand):
    help = 'Run SQL schema files to set up the database'

    def handle(self, *args, **options):
        # Get the path to the database schema files
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        # Go up to project root, then into database/schema
        schema_dir = os.path.join(base_dir, '..', 'database', 'schema')
        
        # Normalize path - go from Backend/apps/core/management/commands up to Digitalfashion_Hub
        schema_dir = os.path.normpath(os.path.join(base_dir, '..', '..', 'database', 'schema'))
        
        self.stdout.write(f'Looking for schema files in: {schema_dir}')
        
        # SQL files to run in order
        sql_files = [
            '001_create_tables.sql',
            '002_indexes.sql', 
            '003_fixes_and_views.sql'
        ]
        
        for sql_file in sql_files:
            file_path = os.path.join(schema_dir, sql_file)
            if os.path.exists(file_path):
                self.stdout.write(f'Running {sql_file}...')
                with open(file_path, 'r') as f:
                    sql_content = f.read()
                
                # Remove comments and split by semicolon
                lines = []
                for line in sql_content.split('\n'):
                    # Remove line comments
                    if '--' in line:
                        line = line[:line.index('--')]
                    lines.append(line)
                
                sql_content = '\n'.join(lines)
                statements = [s.strip() for s in sql_content.split(';') if s.strip()]
                
                with connection.cursor() as cursor:
                    for i, statement in enumerate(statements):
                        if statement.upper().startswith('CREATE DATABASE'):
                            # Skip database creation - already exists
                            continue
                        try:
                            cursor.execute(statement)
                            self.stdout.write(f'  Statement {i+1} executed')
                        except Exception as e:
                            self.stderr.write(f'  Error in statement {i+1}: {e}')
                
                self.stdout.write(self.style.SUCCESS(f'Completed {sql_file}'))
            else:
                self.stdout.write(self.style.WARNING(f'File not found: {file_path}'))
        
        self.stdout.write(self.style.SUCCESS('Database schema setup complete!'))