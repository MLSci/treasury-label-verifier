# Treasury Label Verifier

A standalone prototype web application for reviewing alcohol beverage labels against structured application data.

The app allows a reviewer to:

- upload a label image
- enter application metadata
- run OCR on the uploaded label
- compare extracted content against submitted application fields
- review matches, possible matches, mismatches, and missing values
- inspect raw OCR output for transparency

## Overview

This prototype was built as a take-home exercise for an AI-powered alcohol label verification workflow.

The goal is to help compliance reviewers identify discrepancies between a submitted alcohol label image and the application data associated with that label.

## Features

- Image upload for alcohol label review
- OCR-based text extraction using Tesseract.js
- Field-by-field comparison for:
  - Brand Name
  - Class / Type
  - Alcohol Content
  - Proof
  - Net Contents
  - Producer / Bottler
  - Country of Origin
  - Government Warning
- Support for match states:
  - Match
  - Possible Match
  - Mismatch
  - Missing
- Raw OCR output display for reviewer visibility
- Sample datasets for beer and bourbon labels

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Tesseract.js

## Local Setup

### Prerequisites

- Node.js 18+ recommended
- npm

### Install dependencies

```powershell
npm install
```

### Run locally

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## How to Use

1. Upload a readable label image.
2. Enter application data manually or load one of the sample datasets.
3. Click **Analyze Label**.
4. Review the comparison table and extracted OCR text.

## Best Results

Best OCR results come from images that are:

- high resolution
- tightly cropped to the label
- front-facing or minimally angled
- well lit
- readable to a human reviewer

## Approach

This prototype uses a lightweight OCR-plus-rules approach rather than a hosted AI API.

### Processing flow

1. Accept label image upload
2. Run OCR on the image using Tesseract.js
3. Extract likely structured fields using pattern matching and heuristics
4. Compare extracted values against reviewer-entered application data
5. Present field-level results and raw OCR text for human review

### Matching strategy

Different fields use different comparison approaches:

- **Brand / class / producer**: token-overlap and OCR line matching
- **Alcohol content / proof / net contents**: regex extraction plus fallback heuristics
- **Government warning**: phrase-based comparison with stricter expectations than other fields

## Assumptions

- This is a standalone prototype and does not integrate with COLA or other federal systems.
- The app is intended to assist a human reviewer, not replace one.
- Label images are expected to be readable, though some OCR noise is tolerated.
- The government warning is important and should be validated carefully, but OCR distortion may still require reviewer judgment.

## Tradeoffs and Limitations

- OCR quality can degrade on curved bottles, low-resolution photos, cluttered backgrounds, or angled shots.
- The extraction logic is heuristic-based and not a production-grade document understanding system.
- Some fields may be classified as possible matches instead of exact matches when OCR is noisy.
- Country of origin detection is limited unless the text is clearly visible on the label.
- This prototype prioritizes explainability and fast iteration over full automation.

## Future Improvements

- Image preprocessing for rotation, denoising, and contrast enhancement
- Bounding-box based OCR review
- Better structured extraction using document layout analysis
- Batch review workflow for multiple labels
- Exportable discrepancy reports
- Configurable validation rules by beverage type

## Deployment

Deploy easily with Vercel or another Next.js-compatible hosting provider.

## Submission Notes

This repository contains:

- all source code
- setup and run instructions
- documentation of approach, tools used, assumptions, and limitations

The deployed application URL should be submitted separately.