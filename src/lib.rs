mod utils;

extern crate fixedbitset;
extern crate js_sys;

use fixedbitset::FixedBitSet;
use wasm_bindgen::prelude::*;

// When th&e `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
}

#[wasm_bindgen]
impl Universe {
    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    pub fn new() -> Universe {
        let width = 64;
        let height = 64;

        let cell_count = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(cell_count);

        for i in 0..cell_count {
            cells.set(i, js_sys::Math::random() < 0.5);
        }

        Universe { width, height, cells }
    }

    pub fn tick(&mut self) {
        let mut next_cells = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let index = self.get_index(row, col);
                let cell = self.cells[index];
                let live_neighbor_count = self.get_live_neighbor_count(row, col);

                next_cells.set(index, match (cell, live_neighbor_count) {
                    // Rule 1: Any live cell with fewer than two live neighbors dies, as if caused
                    // by underpopulation.
                    (true, live_neighbor_count) if live_neighbor_count < 2 => false,

                    // Rule 2: Any live cell with two or three live neighbors lives on to the next
                    // generation.
                    (true, 2) | (true, 3) => true,

                    // Rule 3: Any live cell with more than three live neighbors dies, as if by
                    // overpopulation.
                    (true, live_neighbor_count) if live_neighbor_count > 3 => false,

                    // Rule 4: Any dead cell with exactly three live neighbors becomes a live cell,
                    // as if by reproduction.
                    (false, 3) => true,

                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                });
            }
        }

        self.cells = next_cells;
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn get_live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let index = self.get_index(neighbor_row, neighbor_col);

                count += self.cells[index] as u8;
            }
        }

        count
    }
}