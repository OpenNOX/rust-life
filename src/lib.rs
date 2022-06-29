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
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: u32, height: u32) -> Universe {
        let cell_count = (width * height) as usize;
        let cells = FixedBitSet::with_capacity(cell_count);

        Universe { width, height, cells }
    }

    pub fn initialize_cells(&mut self) {
        let cell_count = (self.width * self.height) as usize;

        for i in 0..cell_count {
            self.cells.set(i, js_sys::Math::random() < 0.5);
        }
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let index = self.get_index(row, column);
        self.cells.set(index, !self.cells[index]);
    }

    pub fn tick(&mut self) {
        let mut next_cells = self.cells.clone();

        for row in 0..self.height {
            for column in 0..self.width {
                let index = self.get_index(row, column);
                let cell = self.cells[index];
                let live_neighbor_count = self.get_live_neighbor_count(row, column);

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

    pub fn get_cells_as_ptr(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn get_live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for row_offset in [self.height - 1, 0, 1].iter().cloned() {
            for column_offset in [self.width - 1, 0, 1].iter().cloned() {
                if row_offset == 0 && column_offset == 0 {
                    continue;
                }

                let neighbor_row = (row + row_offset) % self.height;
                let neighbor_column = (column + column_offset) % self.width;
                let index = self.get_index(neighbor_row, neighbor_column);

                count += self.cells[index] as u8;
            }
        }

        count
    }
}

impl Universe {
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)], enabled: bool) {
        for (row, column) in cells.iter().cloned() {
            self.cells.set(self.get_index(row, column), enabled);
        }
    }
}