---
title: "Hello There"
description: "This may or may not be the first attempt at a portfolio website that I've actually finished."
pubDate: "Oct 21 2023"
heroImage: "/content/blog/1-hello-there/hello_there.png"
tags: []
---

# Welcome to my site!

Hello there! My name is Tien Cheng, and I'm an aspiring machine learning engineer in Singapore. I graduated from Singapore Polytechnic with a Diploma in Applied AI and Analytics, and I will be enrolling in the National University of Singapore to pursue a degree in Computer Science after I complete my National Service.

As of the time of writing, I'm currently working on a startup I co-founded called [Flora](https://flora.so), where we develop enterprise search software as a service.

This site/blog has been a long time coming. I've intended to create a portfolio site for a while now, but I never really got around to it. I've actually tried to create a site a few times before, but I never actually finished it. So, I decided to try again, and this time, I managed to finish it!

So, in celebration of this momentous occasion, I decided to write a blog post about my experiences with building this site. I hope you enjoy it!

## Why did this take so long?

![Meme](/content/blog/1-hello-there/meme.jpeg)

### Attempt 1: JAMstack, I Choose You!

Surprisingly, my first attempt nearly succeeded, mostly because my plan was quite simple. My site would be a simple JAMstack website using the [Terminal](https://github.com/panr/hugo-theme-terminal) Hugo theme (which I thought looked pretty nice). I chose a JAMStack because I had recently bought a book on JAMStack development, and I wanted to try it out for myself.

And I did it! I created my site and hosted it on Netlify under the `tiencheng.io` domain.

The only reason I didn't consider it a success was that I didn't actually finish the site content. I only managed to write one blog post before I got distracted by other things.

![My first site](/content/blog/1-hello-there/site-v1.png)

To be honest, it's a pretty decent looking site (and I still love the theme), but for some reason, I just wasn't that interested in it. So, there it sat, gathering dust in the corner of the internet.

### Attempt 2: Electric Boogaloo

My second attempt was a bit more ambitious. I decided that I wanted to build a site from scratch using Vue.js (since I had recently learned it as part of my internship). I decided to go all out on this and even designed the entire site in Figma (which I had to learn how to use).

![My second site](/content/blog/1-hello-there/site-v2-1.png)

This time around, I wanted my site to be more playful and interactive, so I decided to turn my projects section into a deck of playing cards (kinda inspired by Cards Against Humanity).

![Playing cards](/content/blog/1-hello-there/site-v2-2.png)

To build the fancy playing cards, I managed to make a custom Vue component that used [SwiperJS](https://swiperjs.com) (which I'm quite proud of). In fact, I was nearly done with the site (the only thing left was really just making the website more responsive on mobile) when I decided to put it on hold to work on my startup.

So, why did this attempt fail? Well, it turns out that building a startup kinda takes up a lot of time. Therefore, my initial design for the site turned out to be a bit too ambitious (trying to get stuff to be mobile-friendly while keeping the design turned out to be harder than I thought). I had to put the entire site on hold for a while to work on my startup 24/7 after my internship, and by the time I got back to it, I had lost all motivation to continue working on it.

### Attempt 3: Third Time's the Charm

So, what actually prompted me to try finishing this site? Well, to be honest, it all started when I received the bill for my domain name: 60 SGD. Now, I don't know about you, but I'm not exactly a fan of paying 60 bucks for something that I'm not even using. I decided that I would either finish the site or just let the domain expire.

Since I'm writing this post, I guess you can tell which option I chose. In fact, I decided to choose both options! It turns out that while the `tiencheng.io` domain I bought from Netlify was pretty expensive, Cloudflare offered a `tiencheng.dev` domain for just 10 bucks a year. Not only that, but they also offered free hosting for static sites! So I figured I might as well finish the site and host it on Cloudflare just to see how it would turn out.

Another major push factor was the fact that I was about to be conscripted into the army. I figured that I might as well finish the site before I got conscripted since I wouldn't have much time to work on it afterward. So, I got to work.

At first, my plan was to do a complete redesign and build my app using SvelteKit and the beautiful [skeleton](https://skeleton.dev) UI framework (which I've been slowly learning for the past few months). But as I was browsing the internet for inspiration, I came across the Astro framework (wow, it's fast), and this beautiful [Astrofy](https://astrofy-template.netlify.app/) template. Since I'm a <strike>lazy</strike> efficient person, I figured that I might as well just use this theme instead of building my own (in any case, using SvelteKit feels kinda overkill for this kind of site). So, I got to work.

And that's pretty much it. I'm honestly quite impressed with this framework. It's blazing fast, and I don't have to install a bunch of packages to get it to render markdown. Naturally, I don't intend on just using this template as is. I'll probably make some changes to it in the future (MathJAX support, anyone?), but for now, I'm quite happy with it.

## What did I learn?

TL;DR: There are a few key things that I learned from this experience:

- Start small and iterate.
  - My biggest mistake with attempt #2 was that I tried to do too much at once. I tried to build a fancy site from scratch, and I ended up burning out when other commitments came up.
- The power of nudges.
  - It turns out that nudges are a great way to get people to do things. In my case, the nudge was the bill for my domain name. I had been putting off finishing this site for a while, but the bill was the final push I needed to get it done.

# So, what's next?

To be honest? I don't know. Maybe I'll write about my experiences with building a startup or about one of my projects. Maybe I'll finally decide to do a complete redesign of this site from scratch. Hell, maybe I'll just write about my day. I guess we'll just have to wait and see. Until then, I hope you have a great day!

## P.S: A Possible Roadmap for Improving this Site

No promises, but here are some things I might do to improve this site in the future:

- Add MathJAX support so I can write math equations
- A button to toggle dark mode
- Finding a way to integrate this with my Obsidian vault so I can publish my notes as blog posts