export CONTAINER_ID="$(cat /proc/self/cgroup | head -n 1 | awk 'BEGIN { FS="/"; } { print $3 }')"

# -- BEGIN OVERRIDABLE VARIABLES --

# OpenVPN root CA CN
[ -z "$EASYRSA_REQ_CN" ] && export EASYRSA_REQ_CN="$CONTAINER_ID" # for CA
# OpenVPN server certificate CN
[ -z "$SERVER_CN" ] && export SERVER_CN="server"
# OpenVPN client certificate CN
[ -z "$CLIENT_CN" ] && export CLIENT_CN="client"

# Set this to 2048 or 4096 in case you are running DNE on a remote machine
[ -z "$EASYRSA_KEY_SIZE" ] && export EASYRSA_KEY_SIZE=512

# Name of the ethernet device on the Docker container
[ -z "$ETH_DEVICE" ] && export ETH_DEVICE="$(ip route show default | awk '{ print $5 }')"

# CIDR IP address of ETH_DEVICE
[ -z "$IP_ADDRESS_CIDR" ] && export IP_ADDRESS_CIDR="$(ip -o addr show "$ETH_DEVICE" | awk '{ print $4 }')"

# Path to store OpenVPN config files
[ -z "$OPENVPN" ] && export OPENVPN="/etc/openvpn"
# Path to store PKI files
[ -z "$EASYRSA_PKI" ] && export EASYRSA_PKI="$OPENVPN/pki"
# Path to store OpenVPN client config files
[ -z "$CLIENT_CONFIG_DIR" ] && export CLIENT_CONFIG_DIR="$OPENVPN/client-config"

[ -z "$OVPN_PROTO" ] && export OVPN_PROTO=tcp
[ -z "$OVPN_PORT" ] && export OVPN_PORT=1194
# Remote address in Client client
[ -z "$OVPN_SERVER_ADDRESS" ] && export OVPN_SERVER_ADDRESS="localhost"
# VPN subnet to draw client addresses from
[ -z "$OVPN_NETWORK_CIDR" ] && export OVPN_NETWORK_CIDR="10.8.0.0/24"

# -- END OVERRIDABLE VARIABLES --

export EASYRSA="/usr/share/easy-rsa"

export CIDR="${IP_ADDRESS_CIDR#*/}"
export IP_ADDRESS="${IP_ADDRESS_CIDR%%/"$CIDR"}"
export SUBNET_MASK="$(cidr2mask "$IP_ADDRESS_CIDR")"
export NETWORK_ADDRESS="$(network "$IP_ADDRESS" "$SUBNET_MASK")"

export OVPN_CIDR="${OVPN_NETWORK_CIDR#*/}"
export OVPN_SUBNET_MASK="$(cidr2mask "$OVPN_CIDR")"
export OVPN_NETWORK="$(network "${OVPN_NETWORK_CIDR%%/"$OVPN_CIDR"}" "$OVPN_SUBNET_MASK")"
