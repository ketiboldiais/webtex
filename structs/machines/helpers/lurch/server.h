#ifndef server_h
#define server_h

#include <stdio.h>
#include <sys/socket.h> // contains socket definitions
#include <netinet/in.h> // contains definitions for Internet Protocol

struct Server {
  int domain;
  int service;
  int protocol;
  u_long interface;
  int port;
  int backlog;
  
  struct sockaddr_in address;
  
  // member function
  void (*launch)(void);
};

struct Server server_constructor(
  int domain,
  int service,
  int protocol,
  u_long interface,
  int port,
  int backlog,
  void(*launch)(void)
);

#endif /* server_h */
