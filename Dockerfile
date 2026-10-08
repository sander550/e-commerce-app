FROM python:3.11

ARG APP_BUILD_ID=unknown

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV APP_BUILD_ID=${APP_BUILD_ID}

ENV PYTHONPATH=/app/src

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
