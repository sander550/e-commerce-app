from fastapi import Request


def get_client_ip(request: Request) -> str:
    """Return the real client IP forwarded by the trusted Nginx proxy."""
    forwarded_ip = request.headers.get("x-real-ip")

    if forwarded_ip:
        return forwarded_ip.strip()

    if request.client is not None:
        return request.client.host

    return "testclient"
