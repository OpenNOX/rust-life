//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate rust_life;
extern crate wasm_bindgen_test;

use rust_life::Universe;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[cfg(test)]
pub fn input_spaceship() -> Universe {
    let mut universe = Universe::new(6, 6);
    universe.set_cells(&[(1,2), (2,3), (3,1), (3,2), (3,3)], true);
    universe
}

#[cfg(test)]
pub fn expected_spaceship() -> Universe {
    let mut universe = Universe::new(6, 6);
    universe.set_cells(&[(2,1), (2,3), (3,2), (3,3), (4,2)], true);
    universe
}

#[wasm_bindgen_test]
pub fn tick_advances_universe_as_expected() {
    let mut input_universe = input_spaceship();
    input_universe.tick();

    let expected_universe = expected_spaceship();

    assert_eq!(&input_universe.get_cells(), &expected_universe.get_cells());
}