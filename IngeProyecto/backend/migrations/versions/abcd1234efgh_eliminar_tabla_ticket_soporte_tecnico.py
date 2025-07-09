"""eliminar tabla ticket soporte tecnico

Revision ID: abcd1234efgh
Revises: 65033d2abbc6
Create Date: 2025-07-09 19:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abcd1234efgh'
down_revision = '65033d2abbc6'
branch_labels = None
depends_on = None


def upgrade():
    # Eliminar la tabla ticket_soporte_tecnico si existe
    try:
        op.drop_table('ticket_soporte_tecnico')
    except Exception:
        # La tabla no existe, no hacer nada
        pass


def downgrade():
    # Recrear la tabla ticket_soporte_tecnico en caso de rollback
    op.create_table('ticket_soporte_tecnico',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('contacto', sa.String(255), nullable=False),
        sa.Column('asunto', sa.String(255), nullable=False),
        sa.Column('descripcion', sa.Text, nullable=False),
        sa.Column('fecha_creacion', sa.DateTime, nullable=False, default=sa.func.current_timestamp()),
        sa.Column('estado', sa.String(50), nullable=False, default='pendiente')
    )
