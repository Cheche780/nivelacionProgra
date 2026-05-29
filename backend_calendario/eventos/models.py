from django.db import models

class Evento(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    fecha = models.DateField() # Guardará el formato YYYY-MM-DD
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo


        