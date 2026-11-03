from dataclasses import dataclass

@dataclass
class MessageDTO:
    message: str

    @staticmethod
    def from_message(msg: str):
        return MessageDTO(message=msg)