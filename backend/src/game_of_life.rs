// backend/src/game_of_life.rs
use rayon::prelude::*;

pub const WIDTH: usize = 20;
pub const HEIGHT: usize = 20;

pub fn index(row: usize, col: usize) -> usize {
    row * WIDTH + col
}

pub fn count_neighbors(grid: &[u8], row: usize, col: usize) -> u8 {
    let mut count = 0;
    for dr in [-1, 0, 1].iter() {
        for dc in [-1, 0, 1].iter() {
            if *dr == 0 && *dc == 0 {
                continue;
            }
            let r = row as isize + dr;
            let c = col as isize + dc;
            if r >= 0 && r < HEIGHT as isize && c >= 0 && c < WIDTH as isize {
                count += grid[index(r as usize, c as usize)];
            }
        }
    }
    count
}

pub fn update(current: &[u8], next: &mut [u8]) {
    next.par_chunks_mut(WIDTH)
        .into_par_iter()
        .enumerate()
        .for_each(|(row, row_slice)| {
            for col in 0..WIDTH {
                let idx = index(row, col);
                let neighbors = count_neighbors(current, row, col);
                row_slice[col] = match (current[idx], neighbors) {
                    (1, 2) | (1, 3) | (0, 3) => 1,
                    _ => 0,
                };
            }
        });
}

pub struct GameOfLife {
    pub current: Vec<u8>,
    pub history: Vec<Vec<u8>>,
    pub initial: Vec<u8>,
}

impl GameOfLife {
    pub fn new(initial: Vec<u8>) -> Self {
        Self {
            current: initial.clone(),
            initial,
            history: Vec::new(),
        }
    }

    pub fn get_state(&self) -> &[u8] {
        &self.current
    }

    pub fn step(&mut self) {
        self.history.push(self.current.clone());
        let mut next = vec![0u8; WIDTH * HEIGHT];
        update(&self.current, &mut next);
        self.current = next;
    }

    pub fn step_back(&mut self) -> bool {
        if let Some(prev) = self.history.pop() {
            self.current = prev;
            true
        } else {
            false
        }
    }

    pub fn toggle_cell(&mut self, row: usize, col: usize) {
        if row < HEIGHT && col < WIDTH {
            let idx = index(row, col);
            self.current[idx] = if self.current[idx] == 0 { 1 } else { 0 };
        }
    }

    pub fn reset(&mut self) {
        self.current = self.initial.clone();
        self.history.clear();
    }
}

pub fn parse_initial_state(initial: &[&str]) -> Vec<u8> {
    let mut grid = Vec::with_capacity(WIDTH * HEIGHT);
    for row in initial {
        for ch in row.chars() {
            let cell = ch.to_digit(10).unwrap_or(0) as u8;
            grid.push(cell);
        }
    }
    grid
}
