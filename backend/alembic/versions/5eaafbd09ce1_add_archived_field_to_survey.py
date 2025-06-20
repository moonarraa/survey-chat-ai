"""add archived field to survey

Revision ID: 5eaafbd09ce1
Revises: d5d81c35c0ee
Create Date: 2025-06-18 07:30:32.395852

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5eaafbd09ce1'
down_revision: Union[str, None] = 'd5d81c35c0ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('surveys', sa.Column('archived', sa.Boolean(), nullable=False, server_default=sa.false()))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('surveys', 'archived')
    # ### end Alembic commands ###
