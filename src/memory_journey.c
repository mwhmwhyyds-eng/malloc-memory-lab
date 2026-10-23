#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* The failure switch injects NULL; it does not exhaust system memory. */
int main(int argc, char **argv) {
    int inject_failure = 0;
    if (argc == 2 && strcmp(argv[1], "--simulate-failure") == 0) {
        inject_failure = 1;
    } else if (argc != 1) {
        fprintf(stderr, "Usage: memory_journey [--simulate-failure]\n");
        return EXIT_FAILURE;
    }

    int *p = inject_failure ? NULL : malloc(4 * sizeof *p);
    printf("{\"schema\":1,\"elements\":4,\"sizeof_int\":%zu,", sizeof *p);
    printf("\"failure_injected\":%s,\"events\":[", inject_failure ? "true" : "false");
    if (p == NULL) {
        puts("{\"kind\":\"allocation_failed\"}]}");
        return EXIT_FAILURE;
    }

    /* Never read the newly allocated, uninitialized elements. */
    printf("{\"kind\":\"allocate\"}");
    for (int i = 0; i < 4; ++i) {
        p[i] = i + 1;
        printf(",{\"kind\":\"write\",\"index\":%d,\"value\":%d}", i, p[i]);
    }
    printf(",{\"kind\":\"read\",\"index\":3,\"value\":%d}", p[3]);
    free(p);
    /* Do not evaluate p or access the former object after free. */
    puts(",{\"kind\":\"free\"}]}");
    /* A complete trace must also reach the output stream successfully. */
    if (fflush(stdout) == EOF || ferror(stdout)) return EXIT_FAILURE;
    return EXIT_SUCCESS;
}
