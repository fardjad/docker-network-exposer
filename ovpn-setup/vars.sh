export ETH_DEVICE="$(ip route show default | awk '{ print $5 }')"
export IP_ADDRESS_CIDR="$(ip -o addr show "$ETH_DEVICE" | awk '{ print $4 }')"
export CIDR="${IP_ADDRESS_CIDR#*/}"
export IP_ADDRESS="${IP_ADDRESS_CIDR%%/"$CIDR"}"
export SUBNET_MASK="$(cidr2mask "$IP_ADDRESS_CIDR")"
export NETWORK_ADDRESS="$(network "$IP_ADDRESS" "$SUBNET_MASK")"
export CONTAINER_ID="$(cat /proc/self/cgroup | head -n 1 | awk 'BEGIN { FS="/"; } { print $3 }')"

export OPENVPN="/etc/openvpn"
export EASYRSA="/usr/share/easy-rsa"
export EASYRSA_PKI="$OPENVPN/pki"
export EASYRSA_REQ_CN="$CONTAINER_ID" # for CA

export SERVER_CN="localhost"
export CLIENT_CN="client"
