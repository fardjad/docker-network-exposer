FROM node:lts-alpine

RUN apk add --update \
  openvpn \
  easy-rsa \
  iptables \
  bash \
  && ln -s /usr/share/easy-rsa/easyrsa /usr/local/bin \
  && rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/*

COPY ./ovpn-setup /opt/ovpn-setup

RUN chmod a+x \
  /opt/ovpn-setup/initpki \
  /opt/ovpn-setup/start

EXPOSE 1194

CMD ["/opt/ovpn-setup/start"]
