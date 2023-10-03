(define-data-var count uint u0)

(define-constant ERR_COUNT_MUST_BE_POSITIVE (err u1001))
(define-constant ERROR_ADD_MORE_THAN_ONE (err u1002))
(define-constant ERR_BLOCK_NOT_FOUND (err u1003))

(define-read-only (get-count)
  (var-get count)
)

(define-read-only (get-count-at-block (block uint))
  (ok (at-block
    (unwrap! (get-block-info? id-header-hash block) ERR_BLOCK_NOT_FOUND)
    (var-get count)
  ))
)

(define-public (increment)
  (ok (var-set count (+ (var-get count) u1)))
)

(define-public (decrement)
  (let ((current-count (var-get count)))
    (asserts! (> current-count u0) ERR_COUNT_MUST_BE_POSITIVE)
    (ok (var-set count (- current-count u1)))
  )
)

(define-public (add (n uint))
  (begin
    (asserts! (> n u1) ERROR_ADD_MORE_THAN_ONE)
    (ok (var-set count (+ (var-get count) n)))
  )
)
