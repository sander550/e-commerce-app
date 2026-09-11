FROM python:3.11

WORKDIR /app

ENV PYTHONPATH=/app/src

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
