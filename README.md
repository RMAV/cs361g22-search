# CS361 Group 22 – Search Microservice

## Overview

This microservice provides **search functionality** that can be used by any main program.  
It exposes a single HTTP endpoint that performs case-insensitive and partial-match search over a predefined list of items.

In my portfolio project, it is used to suggest restaurants based on what the user types into a search bar, but it is designed to be generic so that any teammate could call it from their own web app.

The service returns items with:

- `id`
- `name`
- `location`

---

## Technology

- Node.js
- Express
- CORS

---

## Endpoint

### `GET /search?query=<keyword>`

Performs a search across all item names and locations.  
The match is:

- case-insensitive
- partial (e.g., `"par"` will match `"Paris"` and `"Le Clarence"`)

#### Query Parameters

- `query` (string, required for meaningful results)  
  The text to search for in `name` and `location`.

---

## Example Request

```http
GET http://localhost:3000/search?query=par
