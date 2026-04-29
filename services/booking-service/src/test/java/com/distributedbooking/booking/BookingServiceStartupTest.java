package com.distributedbooking.booking;

import static org.assertj.core.api.Assertions.assertThat;

import com.distributedbooking.booking.api.AdminEventBookingSummaryResponse;
import com.distributedbooking.booking.api.BookingController;
import com.distributedbooking.booking.api.MyBookingSummaryResponse;
import com.distributedbooking.booking.domain.BookingQueryService;
import com.distributedbooking.booking.domain.BookingReservation;
import com.distributedbooking.booking.domain.BookingWriteService;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

class BookingServiceStartupTest {

    private final WebApplicationContextRunner contextRunner = new WebApplicationContextRunner()
            .withUserConfiguration(BookingServiceApplication.class, TestOverrides.class)
            .withPropertyValues(
                    "spring.autoconfigure.exclude="
                            + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                            + "org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration,"
                            + "org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration",
                    "app.security.allowed-origins=http://localhost:5173",
                    "app.security.jwt.secret=integration-test-secret-value-with-more-than-thirty-two-chars",
                    "app.security.cookie.name=booking_access_token"
            );

    @Test
    void contextStartsWithSingleBookingControllerMappings() {
        contextRunner.run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context).hasSingleBean(BookingController.class);

            RequestMappingHandlerMapping handlerMapping =
                    context.getBean("requestMappingHandlerMapping", RequestMappingHandlerMapping.class);

            assertThat(findHandlers(handlerMapping, RequestMethod.POST, "/api/bookings")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.POST, "/api/bookings/batch")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.GET, "/api/users/me/bookings")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.GET, "/api/users/me/waitlist")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.DELETE, "/api/bookings/{bookingId}")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.GET, "/api/admin/events/{eventId}/bookings")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.GET, "/api/admin/events/{eventId}/waitlist")).hasSize(1);
            assertThat(findHandlers(handlerMapping, RequestMethod.GET, "/api/admin/email-outbox")).hasSize(1);
        });
    }

    private List<HandlerMethod> findHandlers(
            RequestMappingHandlerMapping handlerMapping,
            RequestMethod method,
            String pattern
    ) {
        return handlerMapping.getHandlerMethods().entrySet().stream()
                .filter(entry -> entry.getKey().getMethodsCondition().getMethods().contains(method))
                .filter(entry -> entry.getKey().getPatternValues().contains(pattern))
                .map(Map.Entry::getValue)
                .toList();
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class TestOverrides {

        @Bean
        BookingWriteService bookingWriteService() {
            return new BookingWriteService(null) {
                @Override
                public BookingReservation reserveSeat(UUID userId, UUID eventId, UUID seatId) {
                    return new BookingReservation(UUID.randomUUID(), eventId, seatId, "A01", OffsetDateTime.now());
                }

                @Override
                public void cancelBooking(UUID userId, UUID bookingId) {
                }
            };
        }

        @Bean
        BookingQueryService bookingQueryService() {
            return new BookingQueryService(null) {
                @Override
                public List<MyBookingSummaryResponse> listUserBookings(UUID userId) {
                    return List.of();
                }

                @Override
                public List<AdminEventBookingSummaryResponse> listEventBookingsForAdmin(UUID eventId) {
                    return List.of();
                }
            };
        }
    }
}
