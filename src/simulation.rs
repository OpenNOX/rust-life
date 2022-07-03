mod timer;

extern crate fixedbitset;
extern crate js_sys;

use crate::simulation::timer::Timer;
use fixedbitset::FixedBitSet;
use std::ops::Add;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Simulation {
    width: u32,
    height: u32,
    cell_count: usize,
    cells_buffers: [FixedBitSet; 2],
    current_buffer_index: usize,
    next_buffer_index: usize,
}

#[wasm_bindgen]
impl Simulation {
    pub fn new(width: u32, height: u32) -> Simulation {
        let cell_count = (width * height) as usize;
        let cells_buffers = [
            FixedBitSet::with_capacity(cell_count),
            FixedBitSet::with_capacity(cell_count),
        ];

        Simulation { width, height, cell_count, cells_buffers, current_buffer_index: 0, next_buffer_index: 0 }
    }

    pub fn initialize_cells(&mut self) {
        for i in 0..self.cell_count {
            self.cells_buffers[self.next_buffer_index].set(i, js_sys::Math::random() < 0.5);
        }
    }

    pub fn clear_cells(&mut self) {
        for i in 0..self.cell_count {
            self.cells_buffers[self.next_buffer_index].set(i, false);
        }
    }

    pub fn toggle_cell(&mut self, cell_index: usize) {
        self.cells_buffers[self.next_buffer_index].set(
            cell_index,
            !self.cells_buffers[self.current_buffer_index][cell_index]);
    }

    pub fn tick(&mut self) {
        let _timer = Timer::new("Simulation::tick");

        self.current_buffer_index = self.next_buffer_index;
        self.next_buffer_index = self.next_buffer_index.add(1).wrapping_rem_euclid(self.cells_buffers.len());

        for row in 0..self.height {
            for column in 0..self.width {
                let index = self.get_index(row, column);
                let cell = self.cells_buffers[self.current_buffer_index][index];
                let live_neighbor_count = self.get_live_neighbor_count(row, column);

                self.cells_buffers[self.next_buffer_index].set(index, match (cell, live_neighbor_count) {
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
    }

    pub fn get_cells_as_ptr(&self) -> *const u32 {
        self.cells_buffers[self.next_buffer_index].as_slice().as_ptr()
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

                count += self.cells_buffers[self.current_buffer_index][index] as u8;
            }
        }

        count
    }
}

impl Simulation {
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells_buffers[self.next_buffer_index]
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)], enabled: bool) {
        for (row, column) in cells.iter().cloned() {
            self.cells_buffers[self.next_buffer_index].set(self.get_index(row, column), enabled);
        }
    }
}