"""merge branches

Revision ID: 65eaa8e1e682
Revises: 20240601_userid_profile_refactor, 4f371db8ee77
Create Date: 2025-07-09 10:54:52.542504

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '65eaa8e1e682'
down_revision = ('20240601_userid_profile_refactor', '4f371db8ee77')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
