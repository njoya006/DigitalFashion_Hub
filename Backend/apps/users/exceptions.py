from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Wrap all DRF errors in a consistent JSON envelope.
    """
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "success": False,
                "error": str(exc),
                "details": response.data,
            },
            status=response.status_code,
        )

    return Response(
        {
            "success": False,
            "error": "Internal server error",
            "details": str(exc),
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
