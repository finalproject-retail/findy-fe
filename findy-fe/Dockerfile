FROM node:22-alpine AS build

WORKDIR /app

ARG EXPO_PUBLIC_API_URL
#ARG EXPO_PUBLIC_DEV_ACCESS_TOKEN

ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
#ENV EXPO_PUBLIC_DEV_ACCESS_TOKEN=$EXPO_PUBLIC_DEV_ACCESS_TOKEN

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run lint
RUN npm run typecheck
RUN npx expo export --platform web

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
