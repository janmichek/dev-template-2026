# Glossary

## Car

One vehicle on the lot: make, model, year, mileage, asking price in US dollars, and a status. The id is the lot number.

## Status

Where a car is in the sale. `available` is for sale, `reserved` is held for a buyer, `sold` has left the lot. Only an available car can be reserved.

## Make

A manufacturer the lot can filter on. The code (`BMW`) is the id. The symbol and color are only for the mark next to the name.

## Stock value

The sum of asking prices of available cars in the current view. Reserved and sold cars do not count.

## Summary

The status counts and the stock value for the cars in view.

## Inventory

The car table for the same view, newest listing first. The dashboard shows the three newest rows. The cars page shows every row, and the URL decides which row is open.

## Reserve

The action that moves an available car to reserved. The server refuses a car that is not available.
