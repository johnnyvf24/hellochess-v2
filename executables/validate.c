#include "defs.h"

int SqOnBoard(const int sq) {
    return (FilesBrd[sq] == OFFBOARD) ? 0 : 1;
}

int SideValid(const int side) {
    return (side == WHITE || side == BLACK || side == GOLD || side == RED) ? 1 :0;
}

int FileRankValid (const int fr) {
    return (fr >= 0 && fr <= 13) ? 1:0;
}

int PieceValidEmpty(const int pce) {
    return (pce >= EMPTY && pce <= rK) ? 1 : 0;
}

int PieceValid(const int pce) {
    return (pce >= wP && pce  <= rK) ? 1 : 0;
}