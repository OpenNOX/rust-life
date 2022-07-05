extern crate fixedbitset;
extern crate js_sys;

use fixedbitset::FixedBitSet;
use std::ops::Add;
use wasm_bindgen::prelude::*;

/// Conway's Game of Life cellular automaton simulation.
#[wasm_bindgen]
pub struct Simulation {
    /// Width in cell count.
    width: u32,

    /// Height in cell count.
    height: u32,

    /// Cells state buffers.
    cells_buffers: [FixedBitSet; 2],

    /// Cells state previous buffer index.
    previous_buffer_index: usize,

    /// Cells state current buffer index.
    current_buffer_index: usize,
}

#[wasm_bindgen]
impl Simulation {
    /// Initializes a new instance of the [`Simulation`].
    ///
    /// * `width` - Width in cell count.
    /// * `height` - Height in cell count.
    pub fn new(width: u32, height: u32) -> Simulation {
        let cell_count = (width * height) as usize;
        let cells_buffers = [
            FixedBitSet::with_capacity(cell_count),
            FixedBitSet::with_capacity(cell_count),
        ];

        Simulation { width, height, cells_buffers, previous_buffer_index: 0, current_buffer_index: 0 }
    }

    /// Initializes cells as alive based on `seed_percent`.
    ///
    /// * `seed_percent` - Chance for cells to be initialized as alive.
    pub fn initialize_cells(&mut self, seed_percent: f64) {
        for i in 0..(self.width * self.height) as usize {
            self.cells_buffers[self.current_buffer_index].set(i, js_sys::Math::random() < seed_percent);
        }
    }

    /// Toggles cell state located at coordinates between alive and dead.
    ///
    /// * `x` - Cell x-axis coordinate.
    /// * `y` - Cell y-axis coordinate.
    pub fn toggle_cell(&mut self, x: u32, y: u32) {
        let cell_index = self.get_cell_index(x, y);

        self.cells_buffers[self.current_buffer_index].set(
            cell_index,
            !self.cells_buffers[self.previous_buffer_index][cell_index]);
    }

    /// Sets all cells to a dead state.
    pub fn clear_cells(&mut self) {
        for i in 0..(self.width * self.height) as usize {
            self.cells_buffers[self.current_buffer_index].set(i, false);
        }
    }

    /// Gets pointer to the start of the cells buffer.
    ///
    /// * `get_current_cells` - Return current cells buffer if `true`, otherwise return previous cells buffer.
    ///
    /// **RETURN:** Pointer to the start of the cells buffer depending on the `get_current_cells` value.
    pub fn get_cells_as_ptr(&self, get_current_cells: bool) -> *const u32 {
        if get_current_cells {
            self.cells_buffers[self.current_buffer_index].as_slice().as_ptr()
        } else {
            self.cells_buffers[self.previous_buffer_index].as_slice().as_ptr()
        }
    }

    /// Advances [`Simulation`] one step according to Conway's Game of Life rules.
    pub fn tick(&mut self) {
        self.previous_buffer_index = self.current_buffer_index;
        self.current_buffer_index = self.current_buffer_index.add(1).wrapping_rem_euclid(self.cells_buffers.len());

        for y in 0..self.height {
            for x in 0..self.width {
                let cell_index = self.get_cell_index(x, y);
                let cell = self.cells_buffers[self.previous_buffer_index][cell_index];
                let live_neighbor_count = self.get_alive_neighbor_count(y, x);

                self.cells_buffers[self.current_buffer_index].set(
                    cell_index,
                    match (cell, live_neighbor_count) {
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

    /// Gets calculated cell index.
    ///
    /// * `x` - Cell x-axis coordinate.
    /// * `y` - Cell y-axis coordinate.
    ///
    /// **RETURNS:** Calculated cell index.
    fn get_cell_index(&self, x: u32, y: u32) -> usize {
        (y * self.width + x) as usize
    }

    /// Gets alive neighbor count.
    ///
    /// * `x` - Cell x-axis coordinate.
    /// * `y` - Cell y-axis coordinate.
    ///
    /// **RETURNS:** Number of alive neighboring cells.
    fn get_alive_neighbor_count(&self, x: u32, y: u32) -> u8 {
        let mut alive_neighbor_count = 0;
        for y_offset in [self.height - 1, 0, 1].iter().cloned() {
            for x_offset in [self.width - 1, 0, 1].iter().cloned() {
                if y_offset == 0 && x_offset == 0 {
                    continue;
                }

                let offset_x = (x + x_offset) % self.width;
                let offset_y = (y + y_offset) % self.height;
                let cell_index = self.get_cell_index(offset_x, offset_y);

                alive_neighbor_count += self.cells_buffers[self.previous_buffer_index][cell_index] as u8;
            }
        }

        alive_neighbor_count
    }
}