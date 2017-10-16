external red : string => string = "" [@@bs.module "chalk"];

external yellow : string => string = "" [@@bs.module "chalk"];

external white : string => string = "" [@@bs.module "chalk"];

let log txt => print_string (txt ^ "\n");

let err txt => prerr_string ("\n" ^ (red "ERROR: " ^ txt) ^ "\n");

let warn txt => prerr_string ("\n" ^ (yellow "WARNING: " ^ txt) ^ "\n");

let step count current msg =>
  log (
    "\n" ^
    "[" ^
    string_of_int current ^
    "/" ^ string_of_int count ^ "] " ^ white msg ^ "..."
  );
