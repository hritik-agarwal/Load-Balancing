## What is load balancer?

Load Balancer is a mechanism which is used to distribute incoming traffic among the servers.

## Why are load balancers used?

These are used to improve the performance of the system and to ensure that resources are optimally utilized to produce maximum throughput.

## How load balancers work?

Load Balancers uses a particular algorithm to choose a server among all to send the request to. After that when any http request comes to load balancer they proxy it to the choosen server.

## Load Balaning Algorithms

3 commonly used alogirthms are -

1. Round Robin => Load balancer choose server in a round robin fashion i.e. 1 -> 2 -> ... n-1 -> n -> 1 -> 2 ...
2. Least Connection => Load balancer picks up the server which is handling least amount of traffic
3. IP Hash => In this server is choosen on the basis of client IP

## How it is implemented in the code?

The load balancer is a process that takes in the HTTP requests and forwards these HTTP requests to one of the server among collection of servers available.

## View Live Demo
https://load-balancer-123.herokuapp.com/
