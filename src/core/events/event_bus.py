from typing import Callable, Dict, List
import logging

from core.events.event import Event

logger = logging.getLogger(__name__)


class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, handler: Callable):
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(handler)

    async def publish(self, event: Event):
        handlers = self._subscribers.get(event.name, [])

        for handler in handlers:
            # One failing subscriber (e.g. SMTP/Redis trouble in the email
            # handler) must not fail the request after the PayPal payment
            # was already captured. Log it and continue with the others.
            try:
                await handler(event)
            except Exception:
                logger.exception(
                    "Event handler %s failed for event '%s'",
                    getattr(handler, "__qualname__", repr(handler)),
                    event.name,
                )


event_bus = EventBus()
