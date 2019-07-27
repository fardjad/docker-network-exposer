# Docker Network Exposer

## Motivation

Using Docker on a non-Linux host has its own shortcomings. Due to the way 
networking is implmeneted in Docker for [Mac][1]/[Windows][2], no bridge 
interface is created on the host. That makes it impossible to access 
containers in a user-defined bridge from the host machine (as one would do in 
Linux) without exposing containers' ports.

Docker Network Exposer (DNE) aims to boost developers' productivity by doing 
the following:

1. Running an [OpenVPN][3] server that makes it possible to seamlessly access 
   a Docker network from the host machine.
2. Generating an [additional hosts file][4] that can be used by [Dnsmasq][5] 
   to resolve Docker container names on the host machine.

## Requriements

1. Docker 18.06.0+ with docker-compose 1.22.0+
2. An OpenVPN client (such as [Tunnelblick][5] or the official [client][6])
3. [Dnsmasq][7] 2.48+

## Usage

Add the following service definition to your `docker-compose.yml`:

    dne:
      image: fardjad/docker-network-exposer
      init: true
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock:ro
        - /path/to/store/openvpn/client-config:/etc/openvpn/client-config
        - /path/to/store/dnsmasq/addn-hosts:/opt/docker-network-hosts/addn-hosts
      cap_add:
        - NET_ADMIN
      ports:
        - '1194:1194'

And adjust volume mappings for the following directories:

1. `/etc/openvpn/client-config`:

    DNE will generate an OpenVPN client config in this directory. The 
    generated config should be imported into the OpenVPN client software.

2. `/opt/docker-network-hosts/addn-hosts`:

    A [hosts file][8] will be written to this directory and gets removed once 
    DNE container is (gracefully) stopped. One can optionally run a Dnsmasq 
    server on the host machine, configure it to forward queries to some 
    upstream servers, instruct it to use the additional hosts files in the 
    abovementioned directory, and finally configure the host machine to 
    resolve DNS queries through Dnsmasq (a minimal example config can be 
    found [here][9]).

    **NOTE:** Dnsmasq service needs to receive a **SIGHUP** signal in order to 
    reload the settings.

Once Dnsmasq is configured and the host machine is connected to the VPN, 
containers on the same Docker network as DNE will be accessible by their 
*names*, *ids* and *aliases*.

## Related Projects / Alternatives

* [devdns][10]
* [dns-proxy-server][11]
* [docker-tuntap-osx][12]

## License

[MIT](https://opensource.org/licenses/MIT)

[1]: https://docs.docker.com/docker-for-mac/networking/#there-is-no-docker0-bridge-on-macos
[2]: https://docs.docker.com/docker-for-windows/networking/#there-is-no-docker0-bridge-on-windows
[3]: https://openvpn.net
[4]: https://wiki.gentoo.org/wiki/Dnsmasq#Additional_hosts_file
[5]: https://tunnelblick.net
[6]: https://openvpn.net
[7]: http://www.thekelleys.org.uk/dnsmasq/doc.html
[8]: https://en.wikipedia.org/wiki/Hosts_(file)
[9]: docs/dnsmasq.conf
[10]: https://github.com/ruudud/devdns
[11]: https://github.com/mageddo/dns-proxy-server
[12]: https://github.com/AlmirKadric-Published/docker-tuntap-osx
