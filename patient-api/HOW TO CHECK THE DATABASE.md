# STEP 1: Run a Tunnel

ssh -fNv -i ~/.ssh/FuseHealth-Pem-Key.pem \
 -L 127.0.0.1:55432:database-1.cv8g82kya3xt.us-east-2.rds.amazonaws.com:5432 \
ec2-user@3.146.121.203

# OR WITH AUTOSSH:

AUTOSSH_GATETIME=0 \
AUTOSSH_POLL=30 \
autossh -M 0 -f -N \
 -i ~/.ssh/FuseHealth-Pem-Key.pem \
 -o "ServerAliveInterval=30" \
 -o "ServerAliveCountMax=3" \
 -o "TCPKeepAlive=yes" \
 -o "ExitOnForwardFailure=yes" \
 -L 127.0.0.1:55432:database-1.cv8g82kya3xt.us-east-2.rds.amazonaws.com:5432 \
 ec2-user@3.146.121.203

# STEP 2: Configure pgAdmin / Beekeeper Studio

Use the port you defined above (55432) and localhost address for the Host: 127.0.0.1
