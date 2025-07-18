"""Remove company and role from user

Revision ID: 49c16ea9e9e9
Revises: b71a05a3277c
Create Date: 2025-06-27 04:22:48.736539

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '49c16ea9e9e9'
down_revision: Union[str, None] = 'b71a05a3277c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'company')
    op.drop_column('users', 'role')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('role', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('company', sa.VARCHAR(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
