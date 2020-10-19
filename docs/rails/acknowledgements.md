# Acknowledgements

This tutorial is written by Melvin Ch’ng and available to everyone at no cost. You may not reproduce this material without seeking the permission of the author.

This is not an ordinary coding tutorial that explains in depth in theory. This is a tutorial that shows you examples and step by step process of design, integrate, and test a feature. I am unable to guarantee that my attempt is the most efficient nor all the information in this tutorial is correct. However, I will try my best to keep the the information as accurate as possible. A secondary source such as documentation is required to understand the concept behind. 

Most of the tutorial was written and tested on a Windows 8.1 machine running Ruby 2.2.3 and Rails 5.0 while some of the tutorial was written on Ruby 2.4.1 and Rails 5.1. The code entered into the terminal window may vary based on the operating system and your system configurations. If you followed my Ruby on Rails Windows, Ubuntu Linux, or MacOS installation guide in this tutorial, you should be able to run run the commands in this tutorial without any issue. 

This tutorial is used as a reference material for the following classes in San Jose State University

|Term|Class|Section|Description|Professor|
|---|---|---|---|---|
|Fall 2016|CMPE 131|01|Software Engineering|Ronald Mak|
|Fall 2016|CMPE 131|03|Software Engineering|Ronald Mak|
|Spring 2017|CMPE 131|03|Software Engineering|Ronald Mak|
|Fall 2017|CMPE 131|05|Software Engineering|Hungwen Li|  

I was invited by Professor Hungwen Li to give a few guest lectures for his CMPE 131 Software Engineering class on Fall 2017. The lecture slide can be downloaded below.

|Topic|Slide|
|---|---|
|Ruby on Rails Introduction|[download](https://melvinchng.github.io/data/CMPE_131_Rails_Intro_09052017.pdf)|
|Database Introduction - Ruby on Rails ORM|[download](https://melvinchng.github.io/data/CMPE_131_Database_Intro_09142017.pdf)|
|Version Control (GitHub) and Software Testing|[download](https://melvinchng.github.io/data/CMPE_131_Github_Testing_10122017.pdf)|

*Note: There is a big jump from Ruby 2.2.3 to Ruby 2.4.1. Please contact me if you followed the tutorial and you are unable to get the same result as discussed*

```c
#include <std_disclaimer.h>
/*
*
* Anyone including myself are not responsible for bricked computer,
* dead hard drives, thermonuclear war, or you getting fired 
* because the installation failed. Please do some research if you 
* have any concern about all the installation files required in this
* guide before installing it! YOU are choosing to make these 
* modifications, and if you point the finger at us for messing up 
* your machine, we will laugh at you.
*
*/	
```