FROM node:20 AS build

ARG APP_BUILD_ID=unknown

WORKDIR /app

ENV VITE_APP_BUILD_ID=${APP_BUILD_ID}

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build && printf '{"build_id":"%s"}\n' "$APP_BUILD_ID" > dist/build-info.json


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
