#[path = "simulation.rs"]
mod simulation;

use crate::simulation::Simulation;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

/// Manages instances of [`Simulation`]s with multithreading.
#[wasm_bindgen]
pub struct InstanceManager {
    /// [`Simulation`] instances map.
    instances: HashMap<String, Simulation>,
}

#[wasm_bindgen]
impl InstanceManager {
    /// Initializes a new instance of the [`InstanceManager`].
    pub fn new() -> InstanceManager {
        let instances = HashMap::new();

        InstanceManager { instances }
    }

    /// Adds a new [`Simulation`] instance to instances [`HashMap`] using instance name as the key.
    ///
    /// * `instance_name` - Name to be associated with the [`Simulation`] instance.
    /// * `width` - [`Simulation`] instance width in cell count.
    /// * `height` - [`Simulation`] instance height in cell count.
    pub fn add_instance(&mut self, instance_name: String, width: u32, height: u32) {
        let simulation = Simulation::new(width, height);

        self.instances.insert(instance_name, simulation);
    }

    /// Gets [`Simulation`] instance from instances [`HashMap`] by the instance name.
    ///
    /// * `instance_name` - Name associated with [`Simulation`] instance.
    ///
    /// **RETURN:** [`Simulation`] instance associated with `instance_name`.
    pub fn get_instance(&self, instance_name: String) -> *const Simulation {
        self.instances.get(&instance_name).unwrap()
    }

    /// Removes [`Simulation`] instance from instances [`HashMap`] by the instance name.
    ///
    /// * `instance_name` - Name associated with [`Simulation`] instance.
    pub fn delete_instance(&mut self, instance_name: String) {
        self.instances.remove(&instance_name);
    }
}