export function euclideanDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

export function feetsToMeters(feets: number){
    return  feets / 3.2808399;
}

export function hypotenuseFromPitagoras(adjoining1: number, adjoining2: number){
    return Math.sqrt(adjoining1 * adjoining1 + adjoining2 * adjoining2);
}