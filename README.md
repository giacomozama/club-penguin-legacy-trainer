# Club Penguin Legacy Trainer

Back in the day, I was known in the Club Penguin hacking community as PenXZ. In a fit of nostalgia, I wanted to try and make Club Penguin hacks in 2022, but how?

**Memory editing?** Only noobs would do that.

**Packet editing?** Not fun.

**Bots?** Penguin Client Library has been remade a million times already.

**ActiveX Flash trainers?** No one knows how to get that stuff working anymore. Also, they don't work with HTML5 private servers.

**Hijack Ruffle to edit variables or call functions?** NOT NEEDLESSLY COMPLICATED ENOUGH.


Yes, you heard it right. We're doing Club Penguin hacks in 2022, and we're doing them in a suboptimal, yet somewhat innovative way. The private server is gonna be Club Penguin Legacy, the reason being it's the first one which I got these to work on.


**So, how does this trainer work?**

This trainer is an electron app that does three things:

1) Downloads and patches .swf files by disassembling and reassembling them with Flasm
2) Runs a local server for serving the patched .swf files
3) Allows you to play the game while redirecting all requests to patched .swf files to your local server

You can patch the .swf files to change a lot of stuff. Right now, a single hack is available, which makes it so that HydroHopper always rewards 1000 coins on exit.


**WiLl ThIs StUfF gEt Me BaNnEd?**

Lol maybe? This is for **educational purposes**. The whole point of hacking Club Penguin back in the day was to learn basic coding and reverse engineering, and that should remain so.

What's the point of trying to gain an unfair advantage on Club Penguin private servers in this day and age, any way?


**How do i run this?**

    npm install
    npm start

You will need NodeJS. Not tested on Windows or Mac.

Waddle on, until the end of days.