FROM haproxy:2.3.4

RUN apt-get update \
    && apt-get install curl -y \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci
COPY . /app
RUN npm run build

CMD /app/bin/marathon-monitor
