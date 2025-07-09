"""Add user_id as FK to all profile-related tables, refactor from user_email, and add id PK to users.

Revision ID: 20240601_userid_profile_refactor
Revises: 5bcc43d3fccf
Create Date: 2024-06-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, select
from sqlalchemy import String, Integer

# revision identifiers, used by Alembic.
revision = '20240601_userid_profile_refactor'
down_revision = '5bcc43d3fccf'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Add 'id' to users (nullable first, then populate, then make primary key)
    op.add_column('users', sa.Column('id', sa.Integer(), nullable=True))
    
    # 2. Populate id for existing users
    conn = op.get_bind()
    users = conn.execute(sa.text('SELECT email FROM users')).fetchall()
    for i, user in enumerate(users, 1):
        conn.execute(sa.text('UPDATE users SET id = :id WHERE email = :email'), 
                    {'id': i, 'email': user[0]})
    
    # 3. Make id not nullable and primary key
    op.alter_column('users', 'id', nullable=False)
    op.drop_constraint('users_pkey', 'users', type_='primary')
    op.create_primary_key('users_pkey', 'users', ['id'])
    
    # 4. Add 'user_id' to all related tables
    op.add_column('profiles', sa.Column('user_id', sa.Integer(), nullable=True))
    op.add_column('skills', sa.Column('user_id', sa.Integer(), nullable=True))
    op.add_column('experiences', sa.Column('user_id', sa.Integer(), nullable=True))
    op.add_column('education', sa.Column('user_id', sa.Integer(), nullable=True))
    op.add_column('profiles', sa.Column('cover_url', sa.String(length=255), nullable=True))
    
    # 5. Populate user_id based on email
    users = conn.execute(sa.text('SELECT id, email FROM users')).fetchall()
    email_to_id = {u[1]: u[0] for u in users}
    for table_name in ['profiles', 'skills', 'experiences', 'education']:
        rows = conn.execute(sa.text(f'SELECT id, user_email FROM {table_name}')).fetchall()
        for row in rows:
            user_id = email_to_id.get(row[1])  # row[1] is user_email
            if user_id:
                conn.execute(sa.text(f'UPDATE {table_name} SET user_id = :user_id WHERE id = :id'), 
                           {'user_id': user_id, 'id': row[0]})
    
    # 6. Set user_id not nullable, unique in profiles
    op.alter_column('profiles', 'user_id', nullable=False)
    op.create_unique_constraint('uq_profiles_user_id', 'profiles', ['user_id'])
    op.alter_column('skills', 'user_id', nullable=False)
    op.alter_column('experiences', 'user_id', nullable=False)
    op.alter_column('education', 'user_id', nullable=False)
    
    # 7. Drop user_email columns
    op.drop_constraint('profiles_user_email_fkey', 'profiles', type_='foreignkey')
    op.drop_column('profiles', 'user_email')
    op.drop_constraint('skills_user_email_fkey', 'skills', type_='foreignkey')
    op.drop_column('skills', 'user_email')
    op.drop_constraint('experiences_user_email_fkey', 'experiences', type_='foreignkey')
    op.drop_column('experiences', 'user_email')
    op.drop_constraint('education_user_email_fkey', 'education', type_='foreignkey')
    op.drop_column('education', 'user_email')
    
    # 8. Add FKs
    op.create_foreign_key('profiles_user_id_fkey', 'profiles', 'users', ['user_id'], ['id'])
    op.create_foreign_key('skills_user_id_fkey', 'skills', 'users', ['user_id'], ['id'])
    op.create_foreign_key('experiences_user_id_fkey', 'experiences', 'users', ['user_id'], ['id'])
    op.create_foreign_key('education_user_id_fkey', 'education', 'users', ['user_id'], ['id'])

def downgrade():
    # Not implemented for brevity
    raise NotImplementedError('Downgrade not supported for this migration.') 