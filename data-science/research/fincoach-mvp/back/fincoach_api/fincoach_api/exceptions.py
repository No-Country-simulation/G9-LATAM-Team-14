from rest_framework.exceptions import NotAuthenticated
from rest_framework.views import exception_handler


def manejador_excepciones(excepcion, contexto):
    respuesta = exception_handler(excepcion, contexto)
    if respuesta is not None and isinstance(excepcion, NotAuthenticated):
        respuesta.data['detail'] = 'Authentication credentials were not found.'
    return respuesta
