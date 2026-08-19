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
    
    response = exception_handler(exc, context)
    
    if response is None:
        return Response(
            {
                'success': False,
                'message': 'An error occurred.',
                'data': None,
                'errors': None,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
    # Extract error details
    detail = response.data.get('detail') if hasattr(response, 'data') else None
    errors = None
    message = 'Request failed.'
    
    if hasattr(response, 'data') and isinstance(response.data, dict):
        # Check for validation errors (field-level)
        if 'detail' in response.data:
            message = str(response.data['detail'])
        else:
            # Field-level validation errors
            errors = response.data
            message = 'Validation failed.'
    
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
