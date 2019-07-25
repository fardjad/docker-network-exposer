FROM node:lts-alpine

RUN apk add --update \
  openvpn \
  easy-rsa \
  iptables \
  bash \
  supervisor \
  ncurses \
  && ln -s /usr/share/easy-rsa/easyrsa /usr/local/bin \
  && rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/*

ENV TERM xterm

WORKDIR /opt/ovpn-setup
COPY ./ovpn-setup .
RUN chmod a+x initpki start
EXPOSE 1194

ENV NODE_ENV production
WORKDIR /opt/docker-network-hosts
COPY docker-network-hosts/package.json .
COPY docker-network-hosts/package-lock.json .
COPY docker-network-hosts/bin ./bin
COPY docker-network-hosts/lib ./lib
COPY docker-network-hosts/start .
RUN mkdir -p addn-hosts
RUN npm install && npm cache clean --force
RUN chmod a+x start

WORKDIR /etc/supervisor
COPY ./supervisor/supervisord.conf .
CMD ["supervisord"]
