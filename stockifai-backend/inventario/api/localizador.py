from django.db.models import IntegerField, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalogo.models import Repuesto, RepuestoTaller

from .serializers import RepuestoSerializer, TallerDisponibilidadSerializer


class LocalizadorPartesView(APIView):
    """Devuelve los talleres que tienen disponible un repuesto específico."""

    def get(self, request):
        numero_pieza = (request.query_params.get("numero_pieza") or "").strip()
        if not numero_pieza:
            return Response(
                {"detail": "El parámetro 'numero_pieza' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        repuesto = (
            Repuesto.objects.select_related("marca", "categoria")
            .filter(numero_pieza__iexact=numero_pieza)
            .first()
        )
        if not repuesto:
            return Response({"repuesto": None, "talleres": []}, status=status.HTTP_200_OK)

        repuestos_taller = (
            RepuestoTaller.objects.filter(repuesto=repuesto)
            .select_related("taller")
            .annotate(
                stock_total=Coalesce(
                    Sum("stocks__cantidad"),
                    Value(0, output_field=IntegerField()),
                )
            )
            .filter(stock_total__gt=0)
        )

        talleres_data = [
            {
                "id": item.taller.id,
                "nombre": item.taller.nombre,
                "direccion": item.taller.direccion,
                "telefono": item.taller.telefono,
                "email": item.taller.email,
                "latitud": float(item.taller.latitud) if item.taller.latitud is not None else None,
                "longitud": float(item.taller.longitud) if item.taller.longitud is not None else None,
                "stock_total": int(item.stock_total or 0),
            }
            for item in repuestos_taller
        ]

        data = {
            "repuesto": RepuestoSerializer(repuesto).data,
            "talleres": TallerDisponibilidadSerializer(talleres_data, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)
