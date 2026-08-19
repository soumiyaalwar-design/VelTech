"""Custom exception handler for standard response envelope."""

from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom exception handler to return standard response envelope.
    
    Response format:
    {
        "success": bool,
        "message": str,
        "data": dict or None,
        "errors": dict or None
    }
    """
    from rest_framework.views import exception_handler
    from django.core.exceptions import ValidationError as DjangoValidationError
    from rest_framework.exceptions import ValidationError as DRFValidationError
    
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, 'message_dict'):
            exc = DRFValidationError(detail=exc.message_dict)
        elif hasattr(exc, 'messages'):
            exc = DRFValidationError(detail=exc.messages)
        else:
            exc = DRFValidationError(detail=str(exc))
    
    response = exception_handler(exc, context)
    
    if response is None:
        import traceback
        traceback.print_exc()
        return Response(
            {
                'success': False,
                'message': str(exc) if str(exc) else 'An unexpected error occurred.',
                'data': None,
                'errors': None,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
    errors = None
    message = 'Request failed.'
    
    if hasattr(response, 'data'):
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
            else:
                errors = response.data
                message = 'Validation failed.'
        elif isinstance(response.data, list):
            if len(response.data) > 0:
                message = str(response.data[0])
            errors = {'non_field_errors': response.data}
        else:
            message = str(response.data)
    
    return Response(
        {
            'success': False,
            'message': message,
            'data': None,
            'errors': errors,
        },
        status=response.status_code,
    )


class StandardResponse:
    """Helper to return standard response envelope."""
    
    @staticmethod
    def success(data=None, message='Success', status_code=status.HTTP_200_OK):
        """Return a success response."""
        return Response(
            {
                'success': True,
                'message': message,
                'data': data,
                'errors': None,
            },
            status=status_code,
        )
    
    @staticmethod
    def error(message='An error occurred', errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """Return an error response."""
        return Response(
            {
                'success': False,
                'message': message,
                'data': None,
                'errors': errors,
            },
            status=status_code,
        )
