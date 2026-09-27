# Relaxation Protocol

A small mobile-friendly web app for working through a 15-module dog relaxation training
protocol — one page per module (with all steps listed), plus a "one at a time" stepper mode,
and progress tracking saved locally on your phone.

Content is transcribed from *Relaxation Exercises*, a handout from The Ohio State University
Veterinary Medical Center's Behavioral Medicine service (Hospital for Companion Animals,
614-292-3551, vet.osu.edu/vmc/behavior). The source PDF isn't included in this repo; only the
exercise steps and general guidance text are reproduced here for personal training use.

## Using it

Open `index.html` (or the deployed GitHub Pages URL) on your phone. From the home screen:

- Tap a module to see all of its steps as a checklist, or switch to "One at a time" for a
  big, single-step view with next/prev controls.
- Tap a step to check it off — progress is saved in your browser's local storage per module.
- "How to use this & general tips" has the full background: choosing a mat, food treat
  guidelines, getting started, and troubleshooting tips.

## Development

No build step — it's plain HTML/CSS/JS. Serve the directory with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Deployment

Static site, deployed via GitHub Pages from the `main` branch root.
